const https = require("https");

module.exports = function handler(req, res) {
try {
const baseUrl = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

```
const url =
  baseUrl +
  "/rest/v1/Dreams?select=id,dream_number,nickname,dream_text,country,instagram,tiktok,created_at&order=dream_number.asc";

https.get(
  url,
  {
    headers: {
      apikey: key,
      Authorization: "Bearer " + key
    }
  },
  function (response) {
    let data = "";

    response.on("data", function (chunk) {
      data += chunk;
    });

    response.on("end", function () {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        return res.status(500).json({
          error: "SUPABASE REQUEST FAILED",
          status: response.statusCode,
          details: data
        });
      }

      try {
        const dreams = JSON.parse(data);

        return res.status(200).json({
          count: dreams.length,
          dreams: dreams
        });
      } catch (error) {
        return res.status(500).json({
          error: "INVALID SUPABASE RESPONSE",
          details: error.message
        });
      }
    });
  }
).on("error", function (error) {
  return res.status(500).json({
    error: "SUPABASE CONNECTION ERROR",
    details: error.message
  });
});
```

} catch (error) {
return res.status(500).json({
error: "WALL ERROR",
details: error.message
});
}
};
