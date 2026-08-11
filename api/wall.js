module.exports = function handler(req, res) {
return res.status(200).json({
require_type: typeof require,
https_type: typeof require("https"),
https_get_type: typeof require("https").get,
res_status_type: typeof res.status,
res_json_type: typeof res.json
});
};
