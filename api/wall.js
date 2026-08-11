```javascript
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/Dreams?select=dream_number,nickname,dream_text,country,instagram,tiktok&order=dream_number.asc`,
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Unable to load dreams: ${errorText}`
      );
    }

    const dreams = await response.json();

    return res.status(200).json({
      count: dreams.length,
      dreams,
    });
  } catch (error) {
    console.error("Wall error:", error);

    return res.status(500).json({
      error: "Unable to load dream wall",
    });
  }
}
```
