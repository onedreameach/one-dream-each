```javascript
module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/Dreams?select=dream_number,nickname,dream_text,country,instagram,tiktok&order=dream_number.asc`,
      {
        method: "GET",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        }
      }
    );

    const text = await response.text();

    if (!response.ok) {
      console.error("SUPABASE ERROR:", text);

      return res.status(500).json({
        error: "Supabase error",
        details: text
      });
    }

    const dreams = JSON.parse(text);

    return res.status(200).json({
      count: dreams.length,
      dreams: dreams
    });

  } catch (error) {
    console.error("WALL ERROR:", error);

    return res.status(500).json({
      error: error.message
    });
  }
};
```
