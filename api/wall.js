export default async function handler(req, res) {
try {
var supabaseUrl = process.env.SUPABASE_URL;
var supabaseKey = process.env.SUPABASE_ANON_KEY;

```
if (!supabaseUrl || !supabaseKey) {
  return res.status(500).json({
    error: "Missing Supabase environment variables"
  });
}

var url =
  supabaseUrl +
  "/rest/v1/Dreams?select=id,dream_number,nickname,dream_text,country,instagram,tiktok,created_at&order=dream_number.asc";

var response = await globalThis.fetch(url, {
  method: "GET",
  headers: {
    "apikey": supabaseKey,
    "Authorization": "Bearer " + supabaseKey
  }
});

var text = await response.text();

if (!response.ok) {
  return res.status(500).json({
    error: "Supabase request failed",
    status: response.status,
    details: text
  });
}

var dreams = JSON.parse(text);

return res.status(200).json({
  count: dreams.length,
  dreams: dreams
});
```

} catch (error) {
return res.status(500).json({
error: "Unable to load dreams",
details: String(error.message || error)
});
}
}
