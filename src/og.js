/*
 * OneDreamEach — Cloudflare-safe OG endpoint
 *
 * IMPORTANT:
 * - Downloadable / shareable 9:16 Dream Cards are generated CLIENT-SIDE
 *   by success.html and src/dream-page.js.
 * - This endpoint serves ONLY the standard Open Graph preview image.
 * - It deliberately avoids server-side PNG rendering to prevent Cloudflare
 *   Worker resource-limit errors (Error 1102).
 */

function json(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        "content-type": "application/json; charset=UTF-8",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff"
      }
    }
  );
}

export async function handleOg(request, env) {
  try {
    const url = new URL(request.url);

    const number =
      String(
        url.searchParams.get("number") || ""
      ).trim();

    const mode =
      String(
        url.searchParams.get("mode") || "og"
      ).trim().toLowerCase();

    /*
     * Keep the number parameter required because every Dream Page
     * points to /api/og?number=...
     */
    if (!number) {
      return json(
        {
          error: "Dream number required"
        },
        400
      );
    }

    /*
     * STORY MODE
     *
     * The browser generates the real 1024x1536 Dream Card.
     * Do not render it inside the Worker.
     */
    if (mode === "story") {
      return json(
        {
          error: "Story Card is generated client-side",
          number,
          hint: "Use the Share Dream Card or Save Dream Card button."
        },
        409
      );
    }

    /*
     * STANDARD OPEN GRAPH
     *
     * Use one static, branded 1200x630-ish PNG for link previews.
     * This is intentionally static and extremely lightweight.
     */
    if (!env.ASSETS) {
      return json(
        {
          error: "ASSETS binding is missing"
        },
        500
      );
    }

    const assetUrl =
      new URL(
        "/og-brand-v2.png",
        request.url
      );

    const assetRequest =
      new Request(
        assetUrl.toString(),
        {
          method: request.method === "HEAD" ? "HEAD" : "GET"
        }
      );

    const assetResponse =
      await env.ASSETS.fetch(
        assetRequest
      );

    if (!assetResponse.ok) {
      return json(
        {
          error: "OG brand image not found",
          status: assetResponse.status
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

    /*
     * OG previews are safe to cache because this image is static.
     * Query ?number=... can vary while the actual image stays the same.
     */
    headers.set(
      "cache-control",
      "public, max-age=86400, s-maxage=86400"
    );

    headers.set(
      "x-content-type-options",
      "nosniff"
    );

    return new Response(
      request.method === "HEAD"
        ? null
        : assetResponse.body,
      {
        status: 200,
        headers
      }
    );
  } catch (error) {
    console.error(
      "OG ERROR:",
      error
    );

    return json(
      {
        error: "Unable to serve OG image",
        message:
          error && error.message
            ? error.message
            : String(error)
      },
      500
    );
  }
}
