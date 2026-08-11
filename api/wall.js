const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
process.env.SUPABASE_URL,
process.env.SUPABASE_ANON_KEY
);

module.exports = async function handler(req, res) {
try {
const { data, error } = await supabase
.from("Dreams")
.select("id,dream_number,nickname,dream_text,country,instagram,tiktok,created_at")
.order("dream_number", { ascending: true });

```
if (error) {
  return res.status(500).json({
    error: "SUPABASE ERROR",
    details: error.message
  });
}

return res.status(200).json({
  count: data.length,
  dreams: data
});
```

} catch (error) {
return res.status(500).json({
error: "WALL ERROR",
details: error.message
});
}
};
