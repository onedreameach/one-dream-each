import Stripe from "stripe";
import { handleDreamPage } from "./dream-page.js";
import { handleOg } from "./og.js";

const ONE_MILLION = 1000000;
const DEFAULT_SITE_URL = "https://onedreameach.com";
const EMAIL_FROM = "OneDreamEach <dreams@onedreameach.com>";


/*
 * =========================================================
 * RESPONSE HELPERS
 * =========================================================
 */

function json(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        "content-type":
          "application/json; charset=UTF-8"
      }
    }
  );
}


function htmlResponse(
  html,
  status = 200,
  extraHeaders = {}
) {
  return new Response(
    html,
    {
      status,
      headers: {
        "content-type":
          "text/html; charset=UTF-8",
        ...extraHeaders
      }
    }
  );
}


function xmlResponse(
  xml,
  status = 200
) {
  return new Response(
    xml,
    {
      status,
      headers: {
        "content-type":
          "application/xml; charset=UTF-8",

        "cache-control":
          "public, s-maxage=300, stale-while-revalidate=3600"
      }
    }
  );
}


/*
 * =========================================================
 * SUPABASE PUBLIC KEY
 * =========================================================
 *
 * Public read endpoints use ANON when available.
 * SERVICE_ROLE is a server-side fallback.
 */

function getSupabaseReadKey(env) {
  return (
    env.SUPABASE_ANON_KEY ||
    env.SUPABASE_SERVICE_ROLE_KEY ||
    ""
  );
}


/*
 * =========================================================
 * ESCAPE HTML
 * =========================================================
 */

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/*
 * =========================================================
 * ESCAPE XML
 * =========================================================
 */

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}


const EMAIL_COUNTRY_CODES = {
  'afghanistan': 'AF',
  'albania': 'AL',
  'algeria': 'DZ',
  'andorra': 'AD',
  'angola': 'AO',
  'argentina': 'AR',
  'armenia': 'AM',
  'australia': 'AU',
  'austria': 'AT',
  'azerbaijan': 'AZ',
  'bahamas': 'BS',
  'bahrain': 'BH',
  'bangladesh': 'BD',
  'barbados': 'BB',
  'belarus': 'BY',
  'belgium': 'BE',
  'belize': 'BZ',
  'benin': 'BJ',
  'bhutan': 'BT',
  'bolivia': 'BO',
  'bosnia and herzegovina': 'BA',
  'botswana': 'BW',
  'brazil': 'BR',
  'brunei': 'BN',
  'bulgaria': 'BG',
  'burkina faso': 'BF',
  'burundi': 'BI',
  'cambodia': 'KH',
  'cameroon': 'CM',
  'canada': 'CA',
  'cape verde': 'CV',
  'central african republic': 'CF',
  'chad': 'TD',
  'chile': 'CL',
  'china': 'CN',
  'colombia': 'CO',
  'comoros': 'KM',
  'congo': 'CG',
  'costa rica': 'CR',
  'croatia': 'HR',
  'cuba': 'CU',
  'cyprus': 'CY',
  'czech republic': 'CZ',
  'czechia': 'CZ',
  'denmark': 'DK',
  'dominican republic': 'DO',
  'ecuador': 'EC',
  'egypt': 'EG',
  'el salvador': 'SV',
  'estonia': 'EE',
  'ethiopia': 'ET',
  'fiji': 'FJ',
  'finland': 'FI',
  'france': 'FR',
  'gabon': 'GA',
  'gambia': 'GM',
  'georgia': 'GE',
  'germany': 'DE',
  'ghana': 'GH',
  'greece': 'GR',
  'guatemala': 'GT',
  'guinea': 'GN',
  'guyana': 'GY',
  'haiti': 'HT',
  'honduras': 'HN',
  'hungary': 'HU',
  'iceland': 'IS',
  'india': 'IN',
  'indonesia': 'ID',
  'iran': 'IR',
  'iraq': 'IQ',
  'ireland': 'IE',
  'israel': 'IL',
  'italy': 'IT',
  'ivory coast': 'CI',
  'jamaica': 'JM',
  'japan': 'JP',
  'jordan': 'JO',
  'kazakhstan': 'KZ',
  'kenya': 'KE',
  'kuwait': 'KW',
  'kyrgyzstan': 'KG',
  'laos': 'LA',
  'latvia': 'LV',
  'lebanon': 'LB',
  'libya': 'LY',
  'liechtenstein': 'LI',
  'lithuania': 'LT',
  'luxembourg': 'LU',
  'madagascar': 'MG',
  'malaysia': 'MY',
  'maldives': 'MV',
  'mali': 'ML',
  'malta': 'MT',
  'mauritania': 'MR',
  'mauritius': 'MU',
  'mexico': 'MX',
  'moldova': 'MD',
  'monaco': 'MC',
  'mongolia': 'MN',
  'montenegro': 'ME',
  'morocco': 'MA',
  'mozambique': 'MZ',
  'myanmar': 'MM',
  'namibia': 'NA',
  'nepal': 'NP',
  'netherlands': 'NL',
  'new zealand': 'NZ',
  'nicaragua': 'NI',
  'niger': 'NE',
  'nigeria': 'NG',
  'north korea': 'KP',
  'north macedonia': 'MK',
  'norway': 'NO',
  'oman': 'OM',
  'pakistan': 'PK',
  'panama': 'PA',
  'paraguay': 'PY',
  'peru': 'PE',
  'philippines': 'PH',
  'poland': 'PL',
  'portugal': 'PT',
  'qatar': 'QA',
  'romania': 'RO',
  'russia': 'RU',
  'rwanda': 'RW',
  'san marino': 'SM',
  'saudi arabia': 'SA',
  'senegal': 'SN',
  'serbia': 'RS',
  'singapore': 'SG',
  'slovakia': 'SK',
  'slovenia': 'SI',
  'somalia': 'SO',
  'south africa': 'ZA',
  'south korea': 'KR',
  'spain': 'ES',
  'sri lanka': 'LK',
  'sudan': 'SD',
  'suriname': 'SR',
  'sweden': 'SE',
  'switzerland': 'CH',
  'syria': 'SY',
  'taiwan': 'TW',
  'tajikistan': 'TJ',
  'tanzania': 'TZ',
  'thailand': 'TH',
  'togo': 'TG',
  'tunisia': 'TN',
  'turkey': 'TR',
  'turkmenistan': 'TM',
  'uganda': 'UG',
  'ukraine': 'UA',
  'united arab emirates': 'AE',
  'united kingdom': 'GB',
  'uk': 'GB',
  'united states': 'US',
  'united states of america': 'US',
  'usa': 'US',
  'uruguay': 'UY',
  'uzbekistan': 'UZ',
  'vatican city': 'VA',
  'venezuela': 'VE',
  'vietnam': 'VN',
  'yemen': 'YE',
  'zambia': 'ZM',
  'zimbabwe': 'ZW'
};


/*
 * =========================================================
 * CONFIRMATION EMAIL HTML
 * =========================================================
 */


function buildEmailHtml({
  paddedNumber,
  nickname,
  dreamText,
  country,
  dreamUrl,
  cardUrl,
  remaining
}) {

  const safeNickname =
    escapeHtml(nickname);

  const safeDream =
    escapeHtml(dreamText);

  const safeCountry =
    escapeHtml(country);

  const safeRemaining =
    Number(remaining)
      .toLocaleString("en-US");

  const cardDownloadUrl =
    dreamUrl +
    "?download=card";

  const emailCountryCode =
    EMAIL_COUNTRY_CODES[
      String(country || "")
        .trim()
        .toLowerCase()
    ] || "";

  const emailFlagUrl =
    emailCountryCode
      ? "https://flagcdn.com/w80/" +
        emailCountryCode.toLowerCase() +
        ".png"
      : "";

  const flagHtml =
    emailFlagUrl
      ? `
        <img
          src="${emailFlagUrl}"
          width="28"
          height="19"
          alt="${safeCountry}"
          style="
            display:inline-block;
            width:28px;
            height:19px;
            object-fit:cover;
            border-radius:3px;
            vertical-align:middle;
            margin-right:8px;
          "
        >
      `
      : "";

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta
    name="viewport"
    content="width=device-width,initial-scale=1"
  >
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#030406;
    color:#F4F7FA;
    font-family:Arial,Helvetica,sans-serif;
  "
>
  <div
    style="
      display:none;
      max-height:0;
      overflow:hidden;
      opacity:0;
      color:transparent;
    "
  >
    Dream #${paddedNumber} is live. Your official Dream Card is ready.
  </div>

  <table
    role="presentation"
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
    style="
      width:100%;
      margin:0;
      padding:0;
      background:#030406;
    "
  >
    <tr>
      <td
        align="center"
        style="padding:28px 12px 44px;"
      >

        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            width:100%;
            max-width:620px;
            background:#07090D;
            border:1px solid #1D2630;
            border-radius:24px;
            overflow:hidden;
          "
        >

          <tr>
            <td
              align="center"
              style="
                padding:30px 28px 18px;
                background:
                  linear-gradient(135deg,#0B0D12,#07131A);
              "
            >
              <img
                src="https://onedreameach.com/logo.png"
                alt="OneDreamEach"
                width="220"
                style="
                  display:block;
                  width:220px;
                  max-width:78%;
                  height:auto;
                  margin:0 auto;
                "
              >
            </td>
          </tr>

          <tr>
            <td
              align="center"
              style="padding:8px 28px 0;"
            >
              <div
                style="
                  color:#22E4EE;
                  font-size:10px;
                  font-weight:900;
                  letter-spacing:3px;
                  text-transform:uppercase;
                "
              >
                YOUR DREAM IS LIVE
              </div>

              <div
                style="
                  margin-top:10px;
                  color:#FFFFFF;
                  font-size:42px;
                  line-height:1;
                  font-weight:900;
                  letter-spacing:-1.4px;
                "
              >
                #${paddedNumber}
              </div>

              <div
                style="
                  margin-top:12px;
                  color:#9EA6AF;
                  font-size:14px;
                  line-height:1.65;
                "
              >
                ${safeNickname}, you just gave your dream a permanent place.
              </div>
            </td>
          </tr>

          <!-- EMAIL DREAM CARD PREVIEW -->
          <tr>
            <td
              align="center"
              style="padding:28px 22px 0;"
            >
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  width:100%;
                  max-width:470px;
                  background:
                    linear-gradient(145deg,#05090C,#090C12);
                  border:1px solid #23404A;
                  border-radius:20px;
                  overflow:hidden;
                "
              >
                <tr>
                  <td
                    style="
                      padding:22px 24px 12px;
                      border-bottom:1px solid #18232A;
                    "
                  >
                    <table
                      role="presentation"
                      width="100%"
                      cellspacing="0"
                      cellpadding="0"
                      border="0"
                    >
                      <tr>
                        <td
                          align="left"
                          style="
                            color:#FFB700;
                            font-size:10px;
                            font-weight:900;
                            letter-spacing:2.4px;
                            text-transform:uppercase;
                          "
                        >
                          THE DREAM
                        </td>

                        <td
                          align="right"
                          style="
                            color:#22E4EE;
                            font-size:11px;
                            font-weight:900;
                            letter-spacing:1px;
                          "
                        >
                          DREAM #${paddedNumber}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding:24px 24px 20px;
                      color:#FFFFFF;
                      font-size:22px;
                      line-height:1.35;
                      font-weight:900;
                      text-align:left;
                    "
                  >
                    “${safeDream}”
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding:0 24px 24px;
                    "
                  >
                    <table
                      role="presentation"
                      width="100%"
                      cellspacing="0"
                      cellpadding="0"
                      border="0"
                    >
                      <tr>
                        <td
                          align="left"
                          style="
                            color:#22E4EE;
                            font-size:9px;
                            font-weight:900;
                            letter-spacing:2.2px;
                            text-transform:uppercase;
                          "
                        >
                          DREAMED BY
                        </td>
                      </tr>

                      <tr>
                        <td
                          align="left"
                          style="
                            padding-top:5px;
                            color:#FFFFFF;
                            font-size:24px;
                            font-weight:900;
                            text-transform:uppercase;
                          "
                        >
                          ${safeNickname}
                        </td>
                      </tr>

                      <tr>
                        <td
                          align="left"
                          style="
                            padding-top:9px;
                            color:#AAB1B8;
                            font-size:12px;
                            font-weight:800;
                            text-transform:uppercase;
                          "
                        >
                          ${flagHtml}${safeCountry}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td
              align="center"
              style="padding:28px 28px 0;"
            >
              <div
                style="
                  color:#E7EBEF;
                  font-size:15px;
                  font-weight:800;
                "
              >
                Your official 9:16 Dream Card is ready.
              </div>

              <div
                style="
                  margin-top:7px;
                  color:#7E8790;
                  font-size:12px;
                  line-height:1.6;
                "
              >
                Save it. Share it. Let someone else dream bigger.
              </div>
            </td>
          </tr>

          <tr>
            <td
              align="center"
              style="padding:18px 28px 0;"
            >
              <a
                href="${cardDownloadUrl}"
                style="
                  display:block;
                  width:100%;
                  max-width:420px;
                  box-sizing:border-box;
                  margin:0 auto;
                  padding:17px 20px;
                  background:linear-gradient(90deg,#7C3AED,#22B8C7);
                  border:1px solid #4A98B1;
                  border-radius:13px;
                  color:#FFFFFF;
                  font-size:14px;
                  font-weight:900;
                  text-decoration:none;
                  letter-spacing:.4px;
                "
              >
                ↓ SAVE MY DREAM CARD
              </a>
            </td>
          </tr>

          <tr>
            <td
              align="center"
              style="padding:11px 28px 0;"
            >
              <a
                href="${dreamUrl}"
                style="
                  display:block;
                  width:100%;
                  max-width:420px;
                  box-sizing:border-box;
                  margin:0 auto;
                  padding:14px 20px;
                  background:#10141A;
                  border:1px solid #29323B;
                  border-radius:12px;
                  color:#E8EDF2;
                  font-size:13px;
                  font-weight:800;
                  text-decoration:none;
                "
              >
                VIEW MY DREAM PAGE →
              </a>
            </td>
          </tr>

          <tr>
            <td
              align="center"
              style="padding:30px 28px 0;"
            >
              <div
                style="
                  width:100%;
                  max-width:440px;
                  margin:0 auto;
                  padding:18px 16px;
                  box-sizing:border-box;
                  background:#080B10;
                  border:1px solid #1C2730;
                  border-radius:14px;
                "
              >
                <div
                  style="
                    color:#22E4EE;
                    font-size:9px;
                    font-weight:900;
                    letter-spacing:2px;
                    text-transform:uppercase;
                  "
                >
                  ONE MILLION DREAM CHALLENGE
                </div>

                <div
                  style="
                    margin-top:9px;
                    color:#FFFFFF;
                    font-size:25px;
                    font-weight:900;
                  "
                >
                  ${paddedNumber} / 1,000,000
                </div>

                <div
                  style="
                    margin-top:5px;
                    color:#6F7881;
                    font-size:12px;
                  "
                >
                  ${safeRemaining} dreams are still waiting.
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td
              align="center"
              style="padding:28px 32px 0;"
            >
              <div
                style="
                  color:#E1E6EA;
                  font-size:15px;
                  font-weight:900;
                "
              >
                Put your dream into the world.
              </div>

              <div
                style="
                  margin-top:8px;
                  color:#7E8790;
                  font-size:12px;
                  line-height:1.7;
                "
              >
                Share your card on TikTok or Instagram,
                tag <strong style="color:#E8EDF2;">@onedreameach</strong>
                and use
                <strong style="color:#22E4EE;">#OneDreamEach</strong>.
              </div>
            </td>
          </tr>

          <tr>
            <td
              align="center"
              style="padding:28px 28px 32px;"
            >
              <div
                style="
                  border-top:1px solid #1B232B;
                  padding-top:19px;
                  color:#59626B;
                  font-size:10px;
                  line-height:1.6;
                "
              >
                One person. One number. One dream.
                <br>
                OneDreamEach.com
              </div>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;
}



/*
 * =========================================================
 * GET DREAM EMAIL STATE
 * =========================================================
 */

async function getDreamEmailState(
  env,
  stripeSessionId
) {

  const url =
    env.SUPABASE_URL +
    "/rest/v1/Dreams" +
    "?select=dream_number,confirmation_email_sent_at" +
    "&stripe_session_id=eq." +
    encodeURIComponent(
      stripeSessionId
    ) +
    "&limit=1";


  const response =
    await fetch(
      url,
      {
        headers: {

          apikey:
            env.SUPABASE_SERVICE_ROLE_KEY,

          Authorization:
            "Bearer " +
            env.SUPABASE_SERVICE_ROLE_KEY

        }
      }
    );


  const text =
    await response.text();


  if (!response.ok) {

    throw new Error(
      "Unable to read dream email state: " +
      text
    );

  }


  const rows =
    text
      ? JSON.parse(text)
      : [];


  if (
    !Array.isArray(rows) ||
    rows.length === 0
  ) {

    throw new Error(
      "Dream not found after creation"
    );

  }


  return rows[0];

}


/*
 * =========================================================
 * MARK CONFIRMATION EMAIL AS SENT
 * =========================================================
 */

async function markEmailAsSent(
  env,
  stripeSessionId
) {

  const url =
    env.SUPABASE_URL +
    "/rest/v1/Dreams" +
    "?stripe_session_id=eq." +
    encodeURIComponent(
      stripeSessionId
    ) +
    "&confirmation_email_sent_at=is.null";


  const response =
    await fetch(
      url,
      {
        method:
          "PATCH",

        headers: {

          "Content-Type":
            "application/json",

          apikey:
            env.SUPABASE_SERVICE_ROLE_KEY,

          Authorization:
            "Bearer " +
            env.SUPABASE_SERVICE_ROLE_KEY,

          Prefer:
            "return=minimal"

        },

        body:
          JSON.stringify({
            confirmation_email_sent_at:
              new Date()
                .toISOString()
          })

      }
    );


  const text =
    await response.text();


  if (!response.ok) {

    throw new Error(
      "Unable to mark email as sent: " +
      text
    );

  }

}


/*
 * =========================================================
 * SEND CONFIRMATION EMAIL
 * =========================================================
 */

async function sendConfirmationEmail(
  env,
  {
    customerEmail,
    sessionId,
    paddedNumber,
    nickname,
    dreamText,
    country,
    dreamUrl,
    cardUrl,
    remaining
  }
) {

  const subject =
    "💭 Your Dream #" +
    paddedNumber +
    " is now part of OneDreamEach";


  const html =
    buildEmailHtml({
      paddedNumber,
      nickname,
      dreamText,
      country,
      dreamUrl,
      cardUrl,
      remaining
    });


  const response =
    await fetch(
      "https://api.resend.com/emails",
      {
        method:
          "POST",

        headers: {

          Authorization:
            "Bearer " +
            env.RESEND_API_KEY,

          "Content-Type":
            "application/json",

          "Idempotency-Key":
            "dream-confirmation/" +
            sessionId

        },

        body:
          JSON.stringify({

            from:
              EMAIL_FROM,

            to: [
              customerEmail
            ],

            subject:
              subject,

            html:
              html

          })

      }
    );


  const text =
    await response.text();


  if (!response.ok) {

    throw new Error(
      "Resend error: " +
      text
    );

  }


  return text
    ? JSON.parse(text)
    : {};

}


/*
 * =========================================================
 * CHECKOUT
 * =========================================================
 */

async function handleCheckout(
  request,
  env
) {

  if (
    request.method !==
    "POST"
  ) {

    return json(
      {
        error:
          "Method not allowed"
      },
      405
    );

  }


  try {

    const body =
      await request.json();


    const nickname =
      String(
        body.nickname || ""
      ).trim();


    const dreamText =
      String(
        body.dream_text || ""
      ).trim();


    const country =
      String(
        body.country || ""
      ).trim();


    const instagram =
      String(
        body.instagram || ""
      ).trim();


    const tiktok =
      String(
        body.tiktok || ""
      ).trim();


    /*
     * Optional Dream Chain referral.
     * The frontend will send the dream number that nominated this person.
     * Example: #18 nominates the next person -> referred_by_dream_number = 18
     */
    const referredByDreamNumberRaw =
      Number.parseInt(
        String(
          body.referred_by_dream_number ||
          body.ref ||
          ""
        ),
        10
      );


    const referredByDreamNumber =
      Number.isInteger(
        referredByDreamNumberRaw
      ) &&
      referredByDreamNumberRaw > 0 &&
      referredByDreamNumberRaw <= ONE_MILLION
        ? referredByDreamNumberRaw
        : null;


    if (
      !nickname ||
      !dreamText ||
      !country
    ) {

      return json(
        {
          error:
            "Nickname, dream and country are required."
        },
        400
      );

    }


    if (
      !env.STRIPE_SECRET_KEY
    ) {

      throw new Error(
        "STRIPE_SECRET_KEY is missing"
      );

    }


    const stripe =
      new Stripe(
        env.STRIPE_SECRET_KEY
      );


    const siteUrl =
      String(
        env.SITE_URL ||
        DEFAULT_SITE_URL
      )
        .replace(
          /\/+$/,
          ""
        );


    const session =
      await stripe
        .checkout
        .sessions
        .create({

          mode:
            "payment",


          line_items: [

            {

              price_data: {

                currency:
                  "eur",

                product_data: {

                  name:
                    "One Dream Each",

                  description:
                    "One place. One dream."

                },

                unit_amount:
                  100

              },


              quantity:
                1

            }

          ],


          success_url:
            siteUrl +
            "/success.html?session_id={CHECKOUT_SESSION_ID}",


          cancel_url:
            siteUrl +
            "/#leave",


          metadata: {

            nickname:
              nickname.slice(
                0,
                40
              ),

            dream_text:
              dreamText.slice(
                0,
                280
              ),

            country:
              country.slice(
                0,
                60
              ),

            instagram:
              instagram.slice(
                0,
                60
              ),

            tiktok:
              tiktok.slice(
                0,
                60
              ),

            /*
             * Stripe metadata values are strings.
             * Blank means this checkout did not come from a nomination.
             */
            referred_by_dream_number:
              referredByDreamNumber
                ? String(
                    referredByDreamNumber
                  )
                : ""

          }

        });


    return json({
      url:
        session.url
    });

  }


  catch (error) {

    console.error(
      "CHECKOUT ERROR:",
      error
    );


    return json(
      {

        error:
          "Unable to create checkout",

        details:
          error?.message ||
          String(error)

      },
      500
    );

  }

}


/*
 * =========================================================
 * DREAM CHAIN HELPERS
 * =========================================================
 *
 * The paid-dream RPC remains untouched.
 * We create the dream atomically exactly as before, then attach
 * the optional referral using the service-role key.
 *
 * referred_by_dream_id = database id of the dream that nominated it.
 * chain_root_id         = database id of the first dream in the chain.
 */

async function getDreamRecordBySession(
  env,
  stripeSessionId
) {

  const params =
    new URLSearchParams();

  params.set(
    "select",
    "id,dream_number,referred_by_dream_id,chain_root_id"
  );

  params.set(
    "stripe_session_id",
    "eq." +
    stripeSessionId
  );

  params.set(
    "limit",
    "1"
  );


  const response =
    await fetch(

      env.SUPABASE_URL +
      "/rest/v1/Dreams?" +
      params.toString(),

      {

        headers: {

          apikey:
            env.SUPABASE_SERVICE_ROLE_KEY,

          Authorization:
            "Bearer " +
            env.SUPABASE_SERVICE_ROLE_KEY

        }

      }

    );


  const responseText =
    await response.text();


  if (!response.ok) {

    throw new Error(
      "Unable to load created Dream Chain record: " +
      responseText
    );

  }


  const rows =
    responseText
      ? JSON.parse(
          responseText
        )
      : [];


  if (
    !Array.isArray(rows) ||
    rows.length === 0
  ) {

    throw new Error(
      "Created dream not found for Dream Chain"
    );

  }


  return rows[0];

}


async function getDreamChainParentByNumber(
  env,
  dreamNumber
) {

  const params =
    new URLSearchParams();

  params.set(
    "select",
    "id,dream_number,chain_root_id"
  );

  params.set(
    "dream_number",
    "eq." +
    String(
      dreamNumber
    )
  );

  params.set(
    "limit",
    "1"
  );


  const response =
    await fetch(

      env.SUPABASE_URL +
      "/rest/v1/Dreams?" +
      params.toString(),

      {

        headers: {

          apikey:
            env.SUPABASE_SERVICE_ROLE_KEY,

          Authorization:
            "Bearer " +
            env.SUPABASE_SERVICE_ROLE_KEY

        }

      }

    );


  const responseText =
    await response.text();


  if (!response.ok) {

    throw new Error(
      "Unable to load referring dream: " +
      responseText
    );

  }


  const rows =
    responseText
      ? JSON.parse(
          responseText
        )
      : [];


  if (
    !Array.isArray(rows) ||
    rows.length === 0
  ) {

    return null;

  }


  return rows[0];

}


async function patchDreamChain(
  env,
  stripeSessionId,
  {
    referredByDreamId,
    chainRootId
  }
) {

  const params =
    new URLSearchParams();

  params.set(
    "stripe_session_id",
    "eq." +
    stripeSessionId
  );


  const response =
    await fetch(

      env.SUPABASE_URL +
      "/rest/v1/Dreams?" +
      params.toString(),

      {

        method:
          "PATCH",

        headers: {

          "Content-Type":
            "application/json",

          apikey:
            env.SUPABASE_SERVICE_ROLE_KEY,

          Authorization:
            "Bearer " +
            env.SUPABASE_SERVICE_ROLE_KEY,

          Prefer:
            "return=minimal"

        },

        body:
          JSON.stringify({

            referred_by_dream_id:
              referredByDreamId,

            chain_root_id:
              chainRootId

          })

      }

    );


  const responseText =
    await response.text();


  if (!response.ok) {

    throw new Error(
      "Unable to save Dream Chain: " +
      responseText
    );

  }

}


async function attachDreamChain(
  env,
  stripeSessionId,
  referredByDreamNumber
) {

  const currentDream =
    await getDreamRecordBySession(
      env,
      stripeSessionId
    );


  /*
   * Idempotent webhook retries:
   * once a chain relationship exists we do not rewrite it.
   */
  if (
    currentDream.chain_root_id ||
    currentDream.referred_by_dream_id
  ) {

    return {

      current_dream_id:
        Number(
          currentDream.id
        ),

      referred_by_dream_id:
        currentDream.referred_by_dream_id
          ? Number(
              currentDream.referred_by_dream_id
            )
          : null,

      chain_root_id:
        currentDream.chain_root_id
          ? Number(
              currentDream.chain_root_id
            )
          : Number(
              currentDream.id
            ),

      linked:
        Boolean(
          currentDream.referred_by_dream_id
        )

    };

  }


  let parentDream =
    null;


  if (
    Number.isInteger(
      referredByDreamNumber
    ) &&
    referredByDreamNumber > 0 &&
    referredByDreamNumber !==
      Number(
        currentDream.dream_number
      )
  ) {

    parentDream =
      await getDreamChainParentByNumber(
        env,
        referredByDreamNumber
      );

  }


  /*
   * A dream that arrives organically starts its own chain.
   * A nominated dream inherits its parent's chain root.
   */
  const chainRootId =
    parentDream
      ? Number(
          parentDream.chain_root_id ||
          parentDream.id
        )
      : Number(
          currentDream.id
        );


  const referredByDreamId =
    parentDream
      ? Number(
          parentDream.id
        )
      : null;


  await patchDreamChain(
    env,
    stripeSessionId,
    {
      referredByDreamId,
      chainRootId
    }
  );


  return {

    current_dream_id:
      Number(
        currentDream.id
      ),

    referred_by_dream_id:
      referredByDreamId,

    chain_root_id:
      chainRootId,

    linked:
      Boolean(
        referredByDreamId
      )

  };

}


/*
 * =========================================================
 * STRIPE WEBHOOK
 * =========================================================
 */

async function handleStripeWebhook(
  request,
  env
) {

  if (
    request.method !==
    "POST"
  ) {

    return json(
      {
        error:
          "Method not allowed"
      },
      405
    );

  }


  try {

    const signature =
      request.headers.get(
        "stripe-signature"
      );


    if (!signature) {

      return json(
        {
          error:
            "Missing Stripe signature"
        },
        400
      );

    }


    if (
      !env.STRIPE_SECRET_KEY
    ) {

      throw new Error(
        "STRIPE_SECRET_KEY is missing"
      );

    }


    if (
      !env.STRIPE_WEBHOOK_SECRET
    ) {

      throw new Error(
        "STRIPE_WEBHOOK_SECRET is missing"
      );

    }


    /*
     * Stripe requires the exact
     * unmodified request body.
     */

    const rawBody =
      await request.text();


    const stripe =
      new Stripe(
        env.STRIPE_SECRET_KEY
      );


    const event =
      await stripe
        .webhooks
        .constructEventAsync(

          rawBody,

          signature,

          env.STRIPE_WEBHOOK_SECRET

        );


    if (
      event.type !==
      "checkout.session.completed"
    ) {

      return json({

        received:
          true,

        ignored:
          true

      });

    }


    const session =
      event.data.object;


    if (
      session.payment_status !==
      "paid"
    ) {

      return json({

        received:
          true,

        paid:
          false

      });

    }


    const metadata =
      session.metadata || {};


    const nickname =
      String(
        metadata.nickname || ""
      )
        .trim()
        .slice(
          0,
          40
        );


    const dreamText =
      String(
        metadata.dream_text || ""
      )
        .trim()
        .slice(
          0,
          280
        );


    const country =
      String(
        metadata.country || ""
      )
        .trim()
        .slice(
          0,
          60
        );


    const instagram =
      String(
        metadata.instagram || ""
      )
        .trim()
        .slice(
          0,
          60
        );


    const tiktok =
      String(
        metadata.tiktok || ""
      )
        .trim()
        .slice(
          0,
          60
        );


    const referredByDreamNumberRaw =
      Number.parseInt(
        String(
          metadata.referred_by_dream_number ||
          ""
        ),
        10
      );


    const referredByDreamNumber =
      Number.isInteger(
        referredByDreamNumberRaw
      ) &&
      referredByDreamNumberRaw > 0 &&
      referredByDreamNumberRaw <= ONE_MILLION
        ? referredByDreamNumberRaw
        : null;


    if (
      !nickname ||
      !dreamText ||
      !country
    ) {

      throw new Error(
        "Missing dream metadata"
      );

    }


    const customerEmail =
      String(

        session
          .customer_details
          ?.email ||

        session
          .customer_email ||

        ""

      )
        .trim()
        .toLowerCase();


    if (
      !env.SUPABASE_URL
    ) {

      throw new Error(
        "SUPABASE_URL is missing"
      );

    }


    if (
      !env.SUPABASE_SERVICE_ROLE_KEY
    ) {

      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY is missing"
      );

    }


    /*
     * ATOMIC DREAM CREATION
     */

    const rpcResponse =
      await fetch(

        env.SUPABASE_URL +
        "/rest/v1/rpc/create_paid_dream",

        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "application/json",

            apikey:
              env.SUPABASE_SERVICE_ROLE_KEY,

            Authorization:
              "Bearer " +
              env.SUPABASE_SERVICE_ROLE_KEY

          },


          body:
            JSON.stringify({

              p_stripe_session_id:
                session.id,

              p_nickname:
                nickname,

              p_dream_text:
                dreamText,

              p_country:
                country,

              p_instagram:
                instagram,

              p_tiktok:
                tiktok

            })

        }

      );


    const rpcText =
      await rpcResponse.text();


    if (
      !rpcResponse.ok
    ) {

      throw new Error(
        "Unable to create dream: " +
        rpcText
      );

    }


    const result =
      rpcText
        ? JSON.parse(
            rpcText
          )
        : [];


    if (
      !Array.isArray(result) ||
      result.length === 0
    ) {

      throw new Error(
        "Database function returned no dream"
      );

    }


    const dream =
      result[0];


    const dreamNumber =
      Number(
        dream.dream_number
      );


    if (
      !Number.isFinite(
        dreamNumber
      )
    ) {

      throw new Error(
        "Invalid dream number"
      );

    }


    const paddedNumber =
      String(
        dreamNumber
      )
        .padStart(
          6,
          "0"
        );


    /*
     * Attach Dream Chain data after the atomic paid-dream creation.
     * This does not modify the existing create_paid_dream RPC.
     */
    const dreamChain =
      await attachDreamChain(
        env,
        session.id,
        referredByDreamNumber
      );


    const siteUrl =
      String(
        env.SITE_URL ||
        DEFAULT_SITE_URL
      )
        .replace(
          /\/+$/,
          ""
        );


    const dreamUrl =
      siteUrl +
      "/dream/" +
      encodeURIComponent(
        dreamNumber
      );


    const cardUrl =
      siteUrl +
      "/api/og?number=" +
      encodeURIComponent(
        dreamNumber
      ) +
      "&mode=story";


    const remaining =
      Math.max(
        0,
        ONE_MILLION -
        dreamNumber
      );


    let emailSent =
      false;


    let emailSkipped =
      false;


    let emailId =
      null;


    if (
      !customerEmail
    ) {

      emailSkipped =
        true;

    }


    else {

      if (
        !env.RESEND_API_KEY
      ) {

        throw new Error(
          "RESEND_API_KEY is missing"
        );

      }


      const emailState =
        await getDreamEmailState(
          env,
          session.id
        );


      if (
        emailState
          .confirmation_email_sent_at
      ) {

        emailSkipped =
          true;

      }


      else {

        const emailResult =
          await sendConfirmationEmail(
            env,
            {

              customerEmail,

              sessionId:
                session.id,

              paddedNumber,

              nickname,

              dreamText,

              country,

              dreamUrl,

              cardUrl,

              remaining

            }
          );


        emailId =
          emailResult?.id ||
          null;


        await markEmailAsSent(
          env,
          session.id
        );


        emailSent =
          true;

      }

    }


    return json({

      received:
        true,

      paid:
        true,

      already_created:
        Boolean(
          dream.already_created
        ),

      dream_number:
        dreamNumber,

      dream_chain:
        dreamChain,

      confirmation_email_sent:
        emailSent,

      confirmation_email_skipped:
        emailSkipped,

      email_id:
        emailId

    });

  }


  catch (error) {

    console.error(
      "STRIPE WEBHOOK ERROR:",
      error
    );


    return json(
      {

        error:
          "Webhook processing error",

        details:
          error?.message ||
          String(error)

      },
      500
    );

  }

}


/*
 * =========================================================
 * DREAM STATUS
 * =========================================================
 *
 * Used by success.html after Stripe Checkout.
 */

async function handleDreamStatus(
  request,
  env
) {

  try {

    if (
      request.method !==
      "GET"
    ) {

      return json(
        {
          error:
            "Method not allowed"
        },
        405
      );

    }


    const url =
      new URL(
        request.url
      );


    const sessionId =
      String(
        url.searchParams
          .get(
            "session_id"
          ) ||
        ""
      ).trim();


    if (
      !sessionId
    ) {

      return json(
        {
          error:
            "Session ID required"
        },
        400
      );

    }


    if (
      !sessionId.startsWith(
        "cs_"
      )
    ) {

      return json(
        {
          error:
            "Invalid session ID"
        },
        400
      );

    }


    if (
      !env.STRIPE_SECRET_KEY
    ) {

      throw new Error(
        "STRIPE_SECRET_KEY is missing"
      );

    }


    const stripe =
      new Stripe(
        env.STRIPE_SECRET_KEY
      );


    const session =
      await stripe
        .checkout
        .sessions
        .retrieve(
          sessionId
        );


    if (
      session.payment_status !==
      "paid"
    ) {

      return json({

        ready:
          false,

        paid:
          false,

        message:
          "Payment is not confirmed yet."

      });

    }


    const supabaseUrl =
      env.SUPABASE_URL;


    const supabaseKey =
      env.SUPABASE_SERVICE_ROLE_KEY ||
      env.SUPABASE_ANON_KEY;


    if (
      !supabaseUrl ||
      !supabaseKey
    ) {

      throw new Error(
        "Supabase environment variables are missing"
      );

    }


    const dreamUrl =
      supabaseUrl +
      "/rest/v1/Dreams" +
      "?select=id,dream_number,nickname,dream_text,country,created_at,referred_by_dream_id,chain_root_id" +
      "&stripe_session_id=eq." +
      encodeURIComponent(
        sessionId
      ) +
      "&limit=1";


    const response =
      await fetch(
        dreamUrl,
        {

          method:
            "GET",

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


    if (
      !response.ok
    ) {

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
     * Payment exists but webhook
     * may still be creating dream.
     */

    if (
      !Array.isArray(
        dreams
      ) ||
      dreams.length === 0
    ) {

      return json({

        ready:
          false,

        paid:
          true,

        message:
          "Dream is being created."

      });

    }


    const dream =
      dreams[0];


    return json({

      ready:
        true,

      paid:
        true,

      dream_number:
        dream.dream_number,

      nickname:
        dream.nickname || "",

      dream_text:
        dream.dream_text || "",

      country:
        dream.country || "",

      referred_by_dream_id:
        dream.referred_by_dream_id || null,

      chain_root_id:
        dream.chain_root_id || null,

      dream_url:
        "/dream/" +
        dream.dream_number

    });

  }


  catch (error) {

    console.error(
      "DREAM STATUS ERROR:",
      error
    );


    return json(
      {

        error:
          "Unable to check dream status",

        details:
          error?.message ||
          String(error)

      },
      500
    );

  }

}


/*
 * =========================================================
 * SINGLE DREAM API
 * =========================================================
 */

async function handleDream(
  request,
  env
) {

  try {

    if (
      request.method !==
      "GET"
    ) {

      return json(
        {
          error:
            "Method not allowed"
        },
        405
      );

    }


    const requestUrl =
      new URL(
        request.url
      );


    const dreamNumber =
      requestUrl
        .searchParams
        .get(
          "number"
        );


    if (
      !dreamNumber
    ) {

      return json(
        {
          error:
            "Dream number required"
        },
        400
      );

    }


    const supabaseUrl =
      env.SUPABASE_URL;


    const supabaseKey =
      getSupabaseReadKey(
        env
      );


    if (
      !supabaseUrl ||
      !supabaseKey
    ) {

      return json(
        {
          error:
            "Supabase environment variables are missing"
        },
        500
      );

    }


    const url =
      supabaseUrl +
      "/rest/v1/Dreams" +
      "?select=id,dream_number,nickname,dream_text,country,instagram,tiktok,created_at,referred_by_dream_id,chain_root_id" +
      "&dream_number=eq." +
      encodeURIComponent(
        dreamNumber
      ) +
      "&limit=1";


    const response =
      await fetch(
        url,
        {

          method:
            "GET",

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


    if (
      !response.ok
    ) {

      return json(
        {

          error:
            "Supabase request failed",

          status:
            response.status,

          details:
            responseText

        },
        500
      );

    }


    const dreams =
      responseText
        ? JSON.parse(
            responseText
          )
        : [];


    if (
      !Array.isArray(
        dreams
      ) ||
      dreams.length === 0
    ) {

      return json(
        {
          error:
            "Dream not found"
        },
        404
      );

    }


    return json(
      dreams[0]
    );

  }


  catch (error) {

    console.error(
      "DREAM API ERROR:",
      error
    );


    return json(
      {

        error:
          "Unable to load dream",

        details:
          error?.message ||
          String(error)

      },
      500
    );

  }

}


/*
 * =========================================================
 * DREAMS API
 * =========================================================
 *
 * Pagination, search, country filter,
 * newest / oldest.
 */

async function handleDreams(
  request,
  env
) {

  try {

    if (
      request.method !==
      "GET"
    ) {

      return json(
        {
          error:
            "Method not allowed"
        },
        405
      );

    }


    const requestUrl =
      new URL(
        request.url
      );


    const page =
      Math.max(
        parseInt(
          requestUrl
            .searchParams
            .get(
              "page"
            ) ||
          "1",
          10
        ),
        1
      );


    const limit =
      Math.min(

        Math.max(
          parseInt(
            requestUrl
              .searchParams
              .get(
                "limit"
              ) ||
            "30",
            10
          ),
          1
        ),

        50

      );


    const sort =
      requestUrl
        .searchParams
        .get(
          "sort"
        ) === "oldest"
        ? "oldest"
        : "newest";


    const search =
      String(
        requestUrl
          .searchParams
          .get(
            "search"
          ) ||
        ""
      )
        .trim()
        .slice(
          0,
          100
        );


    const country =
      String(
        requestUrl
          .searchParams
          .get(
            "country"
          ) ||
        ""
      )
        .trim()
        .slice(
          0,
          60
        );


    const offset =
      (page - 1) *
      limit;


    const params =
      new URLSearchParams();


    params.set(
      "select",
      "id,dream_number,nickname,dream_text,country,instagram,tiktok,created_at,referred_by_dream_id,chain_root_id"
    );


    params.set(
      "order",
      sort === "oldest"
        ? "dream_number.asc"
        : "dream_number.desc"
    );


    params.set(
      "limit",
      String(limit)
    );


    params.set(
      "offset",
      String(offset)
    );


    /*
     * SEARCH
     */

    if (
      search
    ) {

      const safeSearch =
        search.replace(
          /[%(),]/g,
          ""
        );


      params.set(
        "or",
        `(nickname.ilike.*${safeSearch}*,dream_text.ilike.*${safeSearch}*,country.ilike.*${safeSearch}*)`
      );

    }


    /*
     * COUNTRY
     */

    if (
      country &&
      country.toLowerCase() !==
      "all"
    ) {

      params.set(
        "country",
        `ilike.${country}`
      );

    }


    const supabaseUrl =
      env.SUPABASE_URL;


    const supabaseKey =
      getSupabaseReadKey(
        env
      );


    if (
      !supabaseUrl ||
      !supabaseKey
    ) {

      throw new Error(
        "Supabase environment variables are missing"
      );

    }


    const url =
      supabaseUrl +
      "/rest/v1/Dreams?" +
      params.toString();


    const response =
      await fetch(
        url,
        {

          headers: {

            apikey:
              supabaseKey,

            Authorization:
              "Bearer " +
              supabaseKey,

            Prefer:
              "count=exact"

          }

        }
      );


    const responseText =
      await response.text();


    if (
      !response.ok
    ) {

      return json(
        {

          error:
            "Supabase request failed",

          status:
            response.status,

          details:
            responseText

        },
        500
      );

    }


    const dreams =
      responseText
        ? JSON.parse(
            responseText
          )
        : [];


    const contentRange =
      response.headers
        .get(
          "content-range"
        );


    let count =
      0;


    if (
      contentRange &&
      contentRange.includes(
        "/"
      )
    ) {

      const totalPart =
        contentRange
          .split(
            "/"
          )
          .pop();


      if (
        totalPart &&
        totalPart !==
        "*"
      ) {

        count =
          Number(
            totalPart
          ) ||
          0;

      }

    }


    if (
      !contentRange
    ) {

      count =
        dreams.length;

    }


    const totalPages =
      count > 0
        ? Math.ceil(
            count /
            limit
          )
        : 0;


    const hasMore =
      page <
      totalPages;


    return json({

      count:
        count,

      page:
        page,

      limit:
        limit,

      totalPages:
        totalPages,

      hasMore:
        hasMore,

      dreams:
        dreams

    });

  }


  catch (error) {

    console.error(
      "DREAMS API ERROR:",
      error
    );


    return json(
      {

        error:
          "Unable to load dreams",

        details:
          error?.message ||
          String(error)

      },
      500
    );

  }

}


/*
 * =========================================================
 * SITEMAP
 * =========================================================
 */

async function handleSitemap(
  request,
  env
) {

  try {

    if (
      request.method !==
      "GET"
    ) {

      return new Response(
        "Method not allowed",
        {
          status:
            405
        }
      );

    }


    const supabaseUrl =
      env.SUPABASE_URL;


    const supabaseKey =
      getSupabaseReadKey(
        env
      );


    if (
      !supabaseUrl ||
      !supabaseKey
    ) {

      throw new Error(
        "Supabase environment variables are missing"
      );

    }


    const response =
      await fetch(

        supabaseUrl +
        "/rest/v1/Dreams" +
        "?select=dream_number,created_at" +
        "&order=dream_number.asc",

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


    const text =
      await response.text();


    if (
      !response.ok
    ) {

      throw new Error(
        "Supabase request failed: " +
        text
      );

    }


    const dreams =
      text
        ? JSON.parse(
            text
          )
        : [];


    let urls =
      `
  <url>
    <loc>https://onedreameach.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>https://onedreameach.com/explore</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;


    dreams.forEach(
      function (
        dream
      ) {

        const number =
          dream.dream_number;


        if (
          !number
        ) {

          return;

        }


        const lastmod =
          dream.created_at
            ? new Date(
                dream.created_at
              )
                .toISOString()
            : null;


        urls +=
          `
  <url>
    <loc>${escapeXml(
      "https://onedreameach.com/dream/" +
      number
    )}</loc>
    ${
      lastmod
        ? `<lastmod>${lastmod}</lastmod>`
        : ""
    }
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;

      }
    );


    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>
${urls}
</urlset>`;


    return xmlResponse(
      xml
    );

  }


  catch (error) {

    console.error(
      "SITEMAP ERROR:",
      error
    );


    return new Response(
      "Unable to generate sitemap",
      {
        status:
          500,

        headers: {
          "content-type":
            "text/plain; charset=UTF-8"
        }
      }
    );

  }

}


/*
 * =========================================================
 * MAIN WORKER
 * =========================================================
 */

export default {

  async fetch(
    request,
    env
  ) {

    const url =
      new URL(
        request.url
      );


    const path =
      url.pathname;

    // Temporary environment diagnostics.
    // Only reports whether variables exist; it never exposes secret values.
    if (path === "/api/debug-env") {
      return json({
        SUPABASE_URL: Boolean(env.SUPABASE_URL),
        SUPABASE_ANON_KEY: Boolean(env.SUPABASE_ANON_KEY),
        SUPABASE_SERVICE_ROLE_KEY: Boolean(env.SUPABASE_SERVICE_ROLE_KEY),
        STRIPE_SECRET_KEY: Boolean(env.STRIPE_SECRET_KEY),
        STRIPE_WEBHOOK_SECRET: Boolean(env.STRIPE_WEBHOOK_SECRET),
        RESEND_API_KEY: Boolean(env.RESEND_API_KEY),
        SITE_URL: Boolean(env.SITE_URL),
        ASSETS: Boolean(env.ASSETS)
      });
    }


    /*
     * =====================================================
     * API — CHECKOUT
     * =====================================================
     */

    if (
      path ===
      "/api/checkout"
    ) {

      return handleCheckout(
        request,
        env
      );

    }


    /*
     * =====================================================
     * API — STRIPE WEBHOOK
     * =====================================================
     */

    if (
      path ===
        "/api/stripe-webhook" ||
      path ===
        "/api/webhook"
    ) {

      return handleStripeWebhook(
        request,
        env
      );

    }


    /*
     * =====================================================
     * API — DREAM STATUS
     * =====================================================
     */

    if (
      path ===
      "/api/dream-status"
    ) {

      return handleDreamStatus(
        request,
        env
      );

    }


    /*
     * =====================================================
     * API — SINGLE DREAM
     * =====================================================
     */

    if (
      path ===
      "/api/dream"
    ) {

      return handleDream(
        request,
        env
      );

    }


    /*
     * =====================================================
     * API — DREAM LIST
     * =====================================================
     */

    if (
      path ===
        "/api/dreams" ||
      path ===
        "/api/explore"
    ) {

      return handleDreams(
        request,
        env
      );

    }


    /*
     * =====================================================
     * SITEMAP
     * =====================================================
     */

    if (
      path ===
      "/sitemap.xml"
    ) {

      return handleSitemap(
        request,
        env
      );

    }


    /*
     * =====================================================
     * DREAM PAGE
     * =====================================================
     */

    const dreamPageMatch =
      path.match(
        /^\/dream\/(\d+)\/?$/
      );

    if (
      dreamPageMatch
    ) {

      return handleDreamPage(
        request,
        env,
        dreamPageMatch[1]
      );

    }


    /*
     * =====================================================
     * OG / DREAM CARD
     * =====================================================
     */

    if (
      path ===
      "/api/og"
    ) {

      return handleOg(
        request,
        env
      );

    }


    /*
     * =====================================================
     * STATIC ASSETS
     * =====================================================
     */

    return env.ASSETS.fetch(
      request
    );

  }

};
