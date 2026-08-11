export default async function handler(req, res) {
  try {
    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/dreams?select=dream_number`
    );

    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status}`);
    }

    const dreams = await response.json();

    res.status(200).json({
      count: dreams.length
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to load dreams"
    });
  }
}
