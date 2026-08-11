module.exports = function handler(req, res) {
try {
var supabase = require("@supabase/supabase-js");

```
return res.status(200).json({
  test: "SUPABASE LIBRARY OK",
  type: typeof supabase,
  createClient: typeof supabase.createClient
});
```

} catch (error) {
return res.status(500).json({
error: "SUPABASE LIBRARY ERROR",
details: error.message
});
}
};
