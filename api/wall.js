module.exports = function handler(req, res) {
return res.status(200).json({
url: process.env.SUPABASE_URL,
key_exists: !!process.env.SUPABASE_ANON_KEY
});
};
