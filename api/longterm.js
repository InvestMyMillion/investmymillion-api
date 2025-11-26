import express from "express";
import cors from "cors";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route – status check
app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "InvestMyMillion API is live.",
  });
});

// Long-term investment model endpoint
app.post("/longterm", (req, res) => {
  const { amount, risk, duration } = req.body || {};

  // Basic validation
  if (!amount || !risk || !duration) {
    return res.json({
      ok: false,
      error: "Please provide amount, risk, and duration.",
    });
  }

  // Risk-based growth assumptions
  const baseGrowthRate =
    risk === "high"
      ? 0.15 // high risk
      : risk === "low"
      ? 0.05 // low risk
      : 0.1; // medium risk

  const years = duration / 12;
  const projectedValue = Math.round(amount * Math.pow(1 + baseGrowthRate, years));

  res.json({
    ok: true,
    input: { amount, risk, duration },
    projectedValue,
    note:
      "This is a simplified demo projection. Real InvestMyMillion models will use deeper analysis and live data.",
  });
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("InvestMyMillion API running on port " + PORT);
});
