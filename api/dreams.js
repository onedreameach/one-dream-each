export default async function handler(req, res) {
  try {
    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/dreams?select=dream_number`,
      {
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      return res.status(500).json({
        error: "Supabase request failed",
        status: response.status,
        details: responseText,
      });
    }

    const dreams = JSON.parse(responseText);

    return res.status(200).json({
      count: dreams.length,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Unable to load dreams",
      details: error.message,
    });
  }
}
