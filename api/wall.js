const https = require("https");

module.exports = function handler(req, res) {
var url = process.env.SUPABASE_URL;
var key = process.env.SUPABASE_ANON_KEY;

var request = https.request(
url + "/rest/v1/Dreams?select=id",
{
method: "GET",
headers: {
apikey: key,
Authorization: "Bearer " + key
}
},
function (response) {
var body = "";

```
  response.on("data", function (chunk) {
    body += chunk;
  });

  response.on("end", function () {
    return res.status(200).json({
      supabase_status: response.statusCode,
      supabase_response: body
    });
  });
}
```

);

request.on("error", function (error) {
return res.status(500).json({
error: "REQUEST ERROR",
details: error.message
});
});

request.end();
};
