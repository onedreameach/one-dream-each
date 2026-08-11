module.exports = async function handler(req, res) {
try {
const dreamNumber = req.query.number;

```
if (!dreamNumber) {
  return res.status(400).json({
    error: "Dream number required"
  });
}

const response = await fetch(
  process.env.SUPABASE_URL +
  "/rest/v1/Dreams?dream_number=eq." +
  encodeURIComponent(dreamNumber) +
  "&select=id,dream_number,nickname,dream_text,country,instagram,tiktok,created_at",
  {
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY,
      Authorization:
        "Bearer " + process.env.SUPABASE_ANON_KEY
    }
  }
);

const text = await response.text();

if (!response.ok) {
  return res.status(500).json({
    error: "Supabase request failed",
    details: text
  });
}

const dreams = JSON.parse(text);

if (dreams.length === 0) {
  return res.status(404).json({
    error: "Dream not found"
  });
}

return res.status(200).json(dreams[0]);
```

} catch (error) {
return res.status(500).json({
error: "Unable to load dream",
details: error.message
});
}
};
