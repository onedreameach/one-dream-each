const { ImageResponse } = require("@vercel/og");

module.exports = async function handler(req, res) {
  try {
    const image = new ImageResponse(
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
          children: "ONE DREAM EACH"
        }
      },
      {
        width: 1200,
        height: 630
      }
    );

    const arrayBuffer =
      await image.arrayBuffer();

    res.setHeader(
      "Content-Type",
      "image/png"
    );

    return res
      .status(200)
      .send(
        Buffer.from(arrayBuffer)
      );

  } catch (error) {

    console.error(
      "OG TEST ERROR:",
      error
    );

    return res.status(500).json({
      error: "Unable to generate OG image",
      details: error.message
    });
  }
};
