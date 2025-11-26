import express from "express";
import cors from "cors";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route – Status check
app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "InvestMyMillion API is live.",
  });
});

// Long-term investment model endpoint
app.post("/longterm", (req, res) => {
  const { amount, risk, duration } = req.body || {};

  if (!amount || !risk || !duration) {
    return res.json({
      ok: false,
      error: "Missing values. Please provide amount, risk, and duration.",
    });
  }

  // Basic growth logic
  const baseGrowthRate =
    risk === "high"
      ? 0.15
      : risk === "low"
      ? 0.05
      : 0.1; // Medium risk = 10%

  const years = duration / 12;
  const projectedValue = Math.round(amount * Math.pow(1 + baseGrowthRate, years));

  res.json({
    ok: true,
    input: { amount, risk, duration },
    projectedValue,
    note:
      "This is a basic demo model. Real InvestMyMillion models will be more advanced.",
  });
});

// Port (Render provides PORT automatically)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(InvestMyMillion API running on port ${PORT});
});
