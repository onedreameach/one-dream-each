export default async function handler(req, res) {
  return res.status(200).json({
    count: 0,
    dreams: []
  });
}
