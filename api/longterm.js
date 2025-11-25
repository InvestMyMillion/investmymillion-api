export default function handler(req, res) {
  return res.status(200).json({
    ok: true,
    message: "InvestMyMillion long-term API is live."
  });
}
