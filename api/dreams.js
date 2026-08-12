export default async function handler(req, res) {
  try {
    const page = Math.max(
      parseInt(req.query.page || "1", 10),
      1
    );

    const limit = Math.min(
      Math.max(
        parseInt(req.query.limit || "30", 10),
        1
      ),
      50
    );

    const sort =
      req.query.sort === "oldest"
        ? "oldest"
        : "newest";

    const search =
      String(req.query.search || "")
        .trim()
        .slice(0, 100);

    const country =
      String(req.query.country || "")
        .trim()
        .slice(0, 60);

    const offset =
      (page - 1) * limit;


    /*
     * BASE URL
     */

    const params =
      new URLSearchParams();

    params.set(
      "select",
      "id,dream_number,nickname,dream_text,country,instagram,tiktok,created_at"
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
     *
     * Cerca contemporaneamente in:
     * nickname
     * dream_text
     * country
     */

    if (search) {

      const safeSearch =
        search
          .replace(/[%(),]/g, "");

      params.set(
        "or",
        `(nickname.ilike.*${safeSearch}*,dream_text.ilike.*${safeSearch}*,country.ilike.*${safeSearch}*)`
      );

    }


    /*
     * COUNTRY FILTER
     */

    if (
      country &&
      country.toLowerCase() !== "all"
    ) {

      params.set(
        "country",
        `ilike.${country}`
      );

    }


    /*
     * SUPABASE REQUEST
     */

    const url =
      process.env.SUPABASE_URL +
      "/rest/v1/Dreams?" +
      params.toString();


    const response =
      await fetch(
        url,
        {
          headers: {
            apikey:
              process.env.SUPABASE_ANON_KEY,

            Authorization:
              "Bearer " +
              process.env.SUPABASE_ANON_KEY,

            Prefer:
              "count=exact"
          }
        }
      );


    const responseText =
      await response.text();


    if (!response.ok) {

      return res
        .status(500)
        .json({
          error:
            "Supabase request failed",

          status:
            response.status,

          details:
            responseText
        });

    }


    const dreams =
      responseText
        ? JSON.parse(responseText)
        : [];


    /*
     * TOTAL COUNT
     *
     * Supabase restituisce:
     * Content-Range: 0-29/1234
     */

    const contentRange =
      response.headers.get(
        "content-range"
      );


    let count = 0;


    if (
      contentRange &&
      contentRange.includes("/")
    ) {

      const totalPart =
        contentRange
          .split("/")
          .pop();


      if (
        totalPart &&
        totalPart !== "*"
      ) {

        count =
          Number(totalPart) || 0;

      }

    }


    /*
     * FALLBACK
     */

    if (
      !contentRange
    ) {

      count =
        dreams.length;

    }


    /*
     * PAGINATION DATA
     */

    const totalPages =
      count > 0
        ? Math.ceil(
            count / limit
          )
        : 0;


    const hasMore =
      page < totalPages;


    /*
     * RESPONSE
     */

    return res
      .status(200)
      .json({

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

    return res
      .status(500)
      .json({

        error:
          "Unable to load dreams",

        details:
          error.message

      });

  }
}
