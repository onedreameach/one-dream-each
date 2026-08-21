/*
 * OneDreamEach — Cloudflare-safe OG endpoint
 *
 * The 9:16 downloadable Dream Card is generated CLIENT-SIDE
 * by success.html and the Dream Page.
 *
 * This endpoint intentionally avoids server-side PNG rendering
 * so the Cloudflare Worker does not hit Error 1102.
 */

function json(
  data,
  status = 200
) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        "content-type":
          "application/json; charset=UTF-8",
        "cache-control":
          "no-store"
      }
    }
  );
}


export async function handleOg(
  request,
  env
) {

  try {

    const url =
      new URL(
        request.url
      );

    const number =
      url.searchParams.get(
        "number"
      );

    const mode =
      url.searchParams.get(
        "mode"
      ) ||
      "og";


    if (!number) {
      return json(
        {
          error:
            "Dream number required"
        },
        400
      );
    }


    /*
     * STORY MODE
     *
     * The browser now creates the actual 1024x1536 PNG.
     */

    if (
      mode ===
      "story"
    ) {

      return json(
        {
          error:
            "Story Card is generated client-side",
          number:
            Number(number),
          hint:
            "Use the Share / Save Dream Card button."
        },
        409
      );
    }


    /*
     * STANDARD OPEN GRAPH
     *
     * Serve the static branded PNG from Assets.
     */

    if (!env.ASSETS) {
      return json(
        {
          error:
            "ASSETS binding is missing"
        },
        500
      );
    }


    const assetUrl =
      new URL(
        "/og-brand-v2.png",
        request.url
      );


    const assetResponse =
      await env.ASSETS.fetch(
        new Request(
          assetUrl.toString(),
          {
            method:
              "GET"
          }
        )
      );


    if (!assetResponse.ok) {
      return json(
        {
          error:
            "OG brand image not found",
          status:
            assetResponse.status
        },
        500
      );
    }


    const headers =
      new Headers(
        assetResponse.headers
      );


    headers.set(
      "content-type",
      "image/png"
    );


    headers.set(
      "cache-control",
      "public, max-age=3600"
    );


    return new Response(
      assetResponse.body,
      {
        status:
          200,
        headers
      }
    );

  }

  catch (error) {

    console.error(
      "OG ERROR:",
      error
    );


    return json(
      {
        error:
          "Unable to serve OG image",
        message:
          error &&
          error.message
            ? error.message
            : String(error)
      },
      500
    );
  }
}
