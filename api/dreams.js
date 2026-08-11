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

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Supabase:", errorText);

      return res.status(500).json({
        error: "Supabase request failed",
        status: response.status,
      });
    }

    const dreams = await response.json();

    return res.status(200).json({
      count: dreams.length,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Unable to load dreams",
    });
  }
}
