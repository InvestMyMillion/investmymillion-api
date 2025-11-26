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

// Long-term investment model endpoint (calculator-style)
app.post("/longterm", (req, res) => {
  const { amount, risk, duration } = req.body || {};

  if (!amount || !risk || !duration) {
    return res.json({
      ok: false,
      error: "Missing values. Please provide amount, risk, and duration.",
    });
  }

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

// --------- NEW: Stock Picker AI v1 ---------

// Simple static universe for now (you can change these later)
const STOCK_UNIVERSE = [
  // Lower risk / defensive
  {
    ticker: "MSFT",
    name: "Microsoft",
    sector: "Technology",
    risk: "low",
    profile: "Mega-cap, diversified, strong cash flow and cloud/AI exposure.",
  },
  {
    ticker: "JNJ",
    name: "Johnson & Johnson",
    sector: "Healthcare",
    risk: "low",
    profile: "Defensive healthcare, long dividend history.",
  },
  {
    ticker: "VUSA",
    name: "Vanguard S&P 500 UCITS ETF",
    sector: "ETF",
    risk: "low",
    profile: "Broad US market exposure in a single ETF.",
  },

  // Medium risk / quality growth
  {
    ticker: "AAPL",
    name: "Apple",
    sector: "Technology",
    risk: "medium",
    profile: "Consumer ecosystem, services and strong brand.",
  },
  {
    ticker: "NVDA",
    name: "NVIDIA",
    sector: "Semiconductors",
    risk: "medium",
    profile: "Key player in AI chips and data centres.",
  },
  {
    ticker: "ASML",
    name: "ASML Holding",
    sector: "Semiconductors",
    risk: "medium",
    profile: "Critical equipment supplier for chip manufacturing.",
  },

  // Higher risk / aggressive growth
  {
    ticker: "TSLA",
    name: "Tesla",
    sector: "Automotive / Energy",
    risk: "high",
    profile: "Growth stock with higher volatility in EV and energy.",
  },
  {
    ticker: "SHOP",
    name: "Shopify",
    sector: "E-Commerce",
    risk: "high",
    profile: "E-commerce infrastructure with higher growth potential.",
  },
  {
    ticker: "SOXL",
    name: "Direxion Daily Semiconductor Bull 3x",
    sector: "ETF (Leveraged)",
    risk: "high",
    profile: "Very high risk leveraged semiconductor ETF.",
  },
];

// Helper to filter by risk and horizon
function selectStocks(risk, horizon) {
  // horizon can be "short", "medium", "long" – for now we’ll just use it in the explanation
  const candidates = STOCK_UNIVERSE.filter((s) => {
    if (risk === "low") return s.risk === "low";
    if (risk === "high") return s.risk === "high";
    return s.risk === "medium" || s.risk === "low"; // medium = blend
  });

  // Pick up to 3 ideas
  return candidates.slice(0, 3);
}

app.post("/stockpicks", (req, res) => {
  const { budget, risk, horizon } = req.body || {};

  if (!budget || !risk || !horizon) {
    return res.json({
      ok: false,
      error: "Missing values. Please provide budget, risk, and horizon.",
    });
  }

  const picks = selectStocks(risk, horizon);
  const perStock = Math.round(budget / picks.length);

  const enhancedPicks = picks.map((stock) => ({
    ...stock,
    suggestedAllocation: perStock,
  }));

  res.json({
    ok: true,
    input: { budget, risk, horizon },
    picks: enhancedPicks,
    note:
      "These are example ideas only – not financial advice. Always do your own research before investing.",
  });
});

// ------------------------------------------

// Port (Render provides PORT automatically)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("InvestMyMillion API running on port " + PORT);
});
