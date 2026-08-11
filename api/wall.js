```javascript
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { data, error } = await supabase
      .from("Dreams")
      .select(
        "dream_number,nickname,dream_text,country,instagram,tiktok"
      )
      .order("dream_number", {
        ascending: true,
      });

    if (error) {
      console.error("Supabase wall error:", error);

      return res.status(500).json({
        error: error.message,
      });
    }

    return res.status(200).json({
      count: data.length,
      dreams: data,
    });
  } catch (error) {
    console.error("Wall error:", error);

    return res.status(500).json({
      error: "Unable to load dream wall",
    });
  }
};
```
