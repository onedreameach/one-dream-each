module.exports = function handler(req, res) {
try {
var baseUrl = process.env.SUPABASE_URL;
var key = process.env.SUPABASE_ANON_KEY;

```
var endpoint =
  baseUrl +
  "/rest/v1/Dreams?select=id,dream_number,nickname,dream_text,country,instagram,tiktok,created_at&order=dream_number.asc";

return res.status(200).json({
  test: "URL OK",
  url_type: typeof endpoint,
  url_start: endpoint.substring(0, 30),
  key_type: typeof key
});
```

} catch (error) {
return res.status(500).json({
error: "URL TEST ERROR",
details: error.message
});
}
};
