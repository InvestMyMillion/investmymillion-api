import express from "express";
import cors from "cors";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route – basic status check
app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "InvestMyMillion API is live.",
  });
});

// Example long-term model endpoint
app.post("/longterm", (req, res) => {
  const { amount, risk, duration } = req.body || {};

  // Very simple placeholder logic – you can upgrade this later
  const baseGrowthRate =
    risk === "high" ? 0.15 : risk === "low" ? 0.05 : 0.1; // 5%–15% yearly
  const years = duration ? duration / 12 : 1;

  const projectedValue = Math.round(amount * Math.pow(1 + baseGrowthRate, years));

  res.json({
    ok: true,
    input: { amount, risk, duration },
    projectedValue,
    note:
      "This is a simple demo projection. Real InvestMyMillion models will be more advanced.",
  });
});

// Port for local / hosting platform
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(InvestMyMillion API running on port ${PORT});
});
