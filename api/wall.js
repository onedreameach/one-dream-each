export default async function handler(req, res) {
try {
const url = process.env.SUPABASE_URL + "/rest/v1/Dreams?select=id,dream_number,nickname,dream_text,country,instagram,tiktok,created_at&order=dream_number.asc";

```
const response = await fetch(url, {
  headers: {
    apikey: process.env.SUPABASE_ANON_KEY,
    Authorization: "Bearer " + process.env.SUPABASE_ANON_KEY
  }
});

const text = await response.text();

if (!response.ok) {
  return res.status(500).json({
    error: "Supabase request failed",
    status: response.status,
    details: text
  });
}

const dreams = JSON.parse(text);

return res.status(200).json({
  count: dreams.length,
  dreams: dreams
});
```

} catch (error) {
return res.status(500).json({
error: "Unable to load dreams",
details: error.message
});
}
}
