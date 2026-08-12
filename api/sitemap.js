module.exports = async function handler(req, res) {
  try {

    const supabaseUrl =
      process.env.SUPABASE_URL;

    const supabaseKey =
      process.env.SUPABASE_ANON_KEY;


    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Supabase environment variables are missing"
      );
    }


    /*
     * LOAD ALL DREAM NUMBERS
     */

    const response =
      await fetch(
        supabaseUrl +
        "/rest/v1/Dreams?select=dream_number,created_at&order=dream_number.asc",
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


    if (!response.ok) {
      throw new Error(
        "Supabase request failed: " +
        text
      );
    }


    const dreams =
      text
        ? JSON.parse(text)
        : [];


    /*
     * ESCAPE XML
     */

    function escapeXml(value) {
      return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    }


    /*
     * STATIC URLS
     */

    let urls = `
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


    /*
     * DREAM URLS
     */

    dreams.forEach(function(dream) {

      const number =
        dream.dream_number;

      if (!number) {
        return;
      }


      const lastmod =
        dream.created_at
          ? new Date(
              dream.created_at
            ).toISOString()
          : null;


      urls += `
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

    });


    /*
     * FINAL XML
     */

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>
${urls}
</urlset>`;


    res.setHeader(
      "Content-Type",
      "application/xml; charset=utf-8"
    );


    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=3600"
    );


    return res
      .status(200)
      .send(xml);

  }

  catch (error) {

    console.error(
      "SITEMAP ERROR:",
      error
    );


    return res
      .status(500)
      .send(
        "Unable to generate sitemap"
      );

  }
};
