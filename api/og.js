module.exports = async function handler(req, res) {
  try {

    const vercelOg =
      require("@vercel/og");

    return res.status(200).json({
      success: true,
      message: "@vercel/og loaded correctly",
      ImageResponseType:
        typeof vercelOg.ImageResponse
    });

  } catch (error) {

    console.error(
      "OG IMPORT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        "Unable to load @vercel/og",
      details:
        error.message
    });

  }
};
