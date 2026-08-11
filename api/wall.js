module.exports = async function handler(req, res) {
try {
var response = await fetch("https://example.com");

```
return res.status(200).json({
  test: "FETCH OK",
  status: response.status
});
```

} catch (error) {
return res.status(500).json({
error: "FETCH ERROR",
details: error.message
});
}
};
