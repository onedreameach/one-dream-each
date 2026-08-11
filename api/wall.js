module.exports = async function handler(req, res) {
try {
var url = process.env.SUPABASE_URL;
var key = process.env.SUPABASE_ANON_KEY;

```
if (!url) {
  return res.status(500).json({
    error: "SUPABASE_URL missing"
  });
}

if (!key) {
  return res.status(500).json({
    error: "SUPABASE_ANON_KEY missing"
  });
}

var endpoint =
  url +
  "/rest/v1/Dreams?select=id,dream_number,nickname,dream_text,country,instagram,tiktok,created_at&order=dream_number.asc";

var response = await fetch(endpoint, {
  method: "GET",
  headers: {
    apikey: key,
    Authorization: "Bearer " + key
  }
});

var text = await response.text();

if (!response.ok) {
  return res.status(500).json({
    error: "SUPABASE REQUEST FAILED",
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
error: "WALL ERROR",
details: error.message
});
}
};
