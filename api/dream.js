module.exports = async function handler(req, res) {
  try {

    /*
     * PRENDI IL NUMERO DEL DREAM DALL'URL
     */

    const requestUrl = new URL(
      req.url,
      "https://onedreameach.com"
    );

    const dreamNumber =
      requestUrl.searchParams.get("number");


    /*
     * CONTROLLO NUMERO
     */

    if (!dreamNumber) {
      return res.status(400).json({
        error: "Dream number required"
      });
    }


    /*
     * VARIABILI SUPABASE
     */

    const supabaseUrl =
      process.env.SUPABASE_URL;

    const supabaseKey =
      process.env.SUPABASE_ANON_KEY;


    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        error: "Supabase environment variables are missing"
      });
    }


    /*
     * COSTRUISCI URL SUPABASE
     */

    const url =
      supabaseUrl +
      "/rest/v1/Dreams" +
      "?select=id,dream_number,nickname,dream_text,country,instagram,tiktok,created_at" +
      "&dream_number=eq." +
      encodeURIComponent(dreamNumber) +
      "&limit=1";


    /*
     * CHIAMATA A SUPABASE
     */

    const response =
      await fetch(
        url,
        {
          method: "GET",

          headers: {
            apikey: supabaseKey,
            Authorization:
              "Bearer " + supabaseKey
          }
        }
      );


    /*
     * LEGGI RISPOSTA
     */

    const responseText =
      await response.text();


    if (!response.ok) {
      return res.status(500).json({
        error: "Supabase request failed",
        status: response.status,
        details: responseText
      });
    }


    /*
     * TRASFORMA IN JSON
     */

    const dreams =
      responseText
        ? JSON.parse(responseText)
        : [];


    /*
     * DREAM NON TROVATO
     */

    if (
      !Array.isArray(dreams) ||
      dreams.length === 0
    ) {

      return res.status(404).json({
        error: "Dream not found"
      });

    }


    /*
     * DREAM TROVATO
     */

    return res.status(200).json(
      dreams[0]
    );

  }

  catch (error) {

    console.error(
      "DREAM API ERROR:",
      error
    );

    return res.status(500).json({
      error: "Unable to load dream",
      details:
        error && error.message
          ? error.message
          : String(error)
    });

  }
};
