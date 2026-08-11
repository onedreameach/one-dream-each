module.exports = function handler(req, res) {
try {
return res.status(200).json({
test: "ENV CHECK",
supabase_url: typeof process.env.SUPABASE_URL,
supabase_key: typeof process.env.SUPABASE_ANON_KEY
});
} catch (error) {
return res.status(500).json({
error: error.message
});
}
};
