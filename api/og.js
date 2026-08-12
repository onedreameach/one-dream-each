module.exports = async function handler(req, res) {
  try {

    /*
     * IMPORT DINAMICO DI @vercel/og
     */

    const {
      ImageResponse
    } = await import(
      "@vercel/og"
    );


    /*
     * CREA IMMAGINE TEST
     */

    const image =
      new ImageResponse(
        {
          type: "div",

          props: {

            style: {
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#050505",
              color: "#ffffff",
              fontSize: "70px",
              fontWeight: 700
            },

            children:
              "ONE DREAM EACH"

          }
        },

        {
          width: 1200,
          height: 630
        }
      );


    /*
     * CONVERTI IN PNG
     */

    const arrayBuffer =
      await image.arrayBuffer();


    res.setHeader(
      "Content-Type",
      "image/png"
    );


    res.setHeader(
      "Cache-Control",
      "public, max-age=0, s-maxage=3600"
    );


    return res
      .status(200)
      .send(
        Buffer.from(
          arrayBuffer
        )
      );

  }

  catch (error) {

    console.error(
      "OG IMAGE ERROR:",
      error
    );


    return res
      .status(500)
      .json({

        error:
          "Unable to generate OG image",

        details:
          error && error.message
            ? error.message
            : String(error)

      });

  }
};
